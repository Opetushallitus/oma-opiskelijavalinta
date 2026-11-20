package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.clients.MaksutClient
import fi.oph.opiskelijavalinta.model.{Hakemus, MaksutLasku, Maksutila}
import fi.oph.opiskelijavalinta.util.KoodistoUtil
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

import java.time.LocalDate
import scala.util.{Failure, Success, Try}

object HakemusmaksuService {
  final val HAKEMUSMAKSU_ORIGIN = "kkhakemusmaksu"
  final val MAKSETTU_STATUS     = "paid"

  /**
   * Maksut-palvelu palauttaa maksupäivän päivämääränä (yyyy-MM-dd) ja maksamattomalle laskulle tyhjän merkkijonon.
   * Päivämääränä käytetään merkkijonon alkuosaa, jotta tulkinta toimii myös, jos maksut-palvelu alkaa palauttaa
   * maksuhetken kellonaikoineen.
   */
  def parseMaksupaiva(paidAt: String): Option[LocalDate] =
    Option(paidAt).map(_.trim).filter(_.nonEmpty).map(arvo => LocalDate.parse(arvo.take(10)))
}

/**
 * Hakemusmaksun maksupäivä ja sen hakemuksen oid, jolla maksu on tehty.
 */
case class HakemusmaksunMaksu(maksanutHakemusOid: String, maksupaiva: LocalDate)

@Service
class HakemusmaksuService @Autowired (
  maksutClient: MaksutClient,
  hakemuksetService: HakemuksetService,
  koutaService: KoutaService,
  mapper: ObjectMapper = new ObjectMapper()
) {
  import HakemusmaksuService.*

  mapper.registerModule(DefaultScalaModule)
  mapper.registerModule(new Jdk8Module())
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)

  private val LOG: Logger = LoggerFactory.getLogger(classOf[HakemusmaksuService])

  /**
   * Palauttaa hakemuksen hakemusmaksun maksupäivän. Jos hakemusmaksu on maksettu toisella hakemuksella
   * (ok-by-proxy), palautetaan sen saman koulutuksen alkamiskauden hakemuksen maksupäivä, jolla maksu tehtiin.
   * Hakemuspalvelu päättelee ok-by-proxy-tilan samalla tavalla henkilön saman alkamiskauden hakemuksista.
   *
   * Rajaus: hakemuspalvelu ei palauta hakijalle inaktivoituja hakemuksia, mutta ottaa ne huomioon ok-by-proxy-tilaa
   * päätellessään. Jos maksanut hakemus on myöhemmin inaktivoitu, maksupäivää ei löydy ja palautetaan None.
   *
   * Linkillä tunnistautunut hakija näkee ok-by-proxy-hakemuksella toisen hakemuksensa maksupäivän. Maksaneen
   * hakemuksen oidia ei palauteta, ja tieto koskee samaa henkilöä.
   */
  def getMaksu(oppijanumero: String, hakemusOid: String): Option[HakemusmaksunMaksu] = {
    val hakemukset = hakemuksetService.getHakemuksetIlmanRikastusta(oppijanumero)
    hakemukset.find(_.oid == hakemusOid) match {
      case None =>
        LOG.warn(s"Hakemusta $hakemusOid ei löytynyt oppijanumerolla $oppijanumero")
        None
      case Some(hakemus) =>
        val maksaneetHakemukset = hakemus.paymentState match {
          case Some(Maksutila.paid)      => List(hakemus)
          case Some(Maksutila.okByProxy) => samanAlkamiskaudenMaksetut(hakemus, hakemukset)
          case _                         => List.empty
        }
        if (hakemus.paymentState.contains(Maksutila.okByProxy) && maksaneetHakemukset.isEmpty) {
          LOG.warn(s"Hakemuksen $hakemusOid hakemusmaksun maksanutta hakemusta ei löytynyt")
        }
        maksaneetHakemukset
          .flatMap(h => haeMaksupaiva(h.oid).map(paiva => HakemusmaksunMaksu(h.oid, paiva)))
          .minByOption(_.maksupaiva.toEpochDay)
    }
  }

  private def samanAlkamiskaudenMaksetut(hakemus: Hakemus, hakemukset: List[Hakemus]): List[Hakemus] =
    alkamiskausi(hakemus) match {
      case None =>
        LOG.warn(s"Hakemuksen ${hakemus.oid} koulutuksen alkamiskautta ei voitu päätellä")
        List.empty
      case kausi =>
        hakemukset.filter(h =>
          h.oid != hakemus.oid && h.paymentState.contains(Maksutila.paid) && alkamiskausi(h) == kausi
        )
    }

  private def alkamiskausi(hakemus: Hakemus): Option[(String, String)] =
    Option(hakemus.haku).filter(_.nonEmpty).flatMap { hakuOid =>
      Try(koutaService.getHaku(hakuOid)) match {
        case Success(haku) =>
          for {
            kausi <- KoodistoUtil.normalizeAlkamiskausi(haku.alkamiskausiKoodiUri)
            vuosi <- haku.alkamisvuosi
          } yield (kausi, vuosi)
        case Failure(e) =>
          LOG.warn(s"Haun $hakuOid tietojen haku epäonnistui: ${e.getMessage}")
          None
      }
    }

  private def haeMaksupaiva(hakemusOid: String): Option[LocalDate] =
    maksutClient.getLaskut(hakemusOid) match {
      case Left(e) =>
        throw RuntimeException(s"Hakemuksen $hakemusOid laskujen haku maksut-palvelusta epäonnistui", e)
      case Right(body) =>
        mapper
          .readValue(body, classOf[Array[MaksutLasku]])
          .toList
          .filter(lasku => lasku.origin == HAKEMUSMAKSU_ORIGIN && lasku.status == MAKSETTU_STATUS)
          .flatMap(lasku => lasku.paidAt.flatMap(parseMaksupaiva))
          .minByOption(_.toEpochDay)
    }
}
