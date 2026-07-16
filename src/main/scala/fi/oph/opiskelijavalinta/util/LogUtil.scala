package fi.oph.opiskelijavalinta.util

import fi.oph.opiskelijavalinta.model.{HakemusEnriched, HakutoiveenTulosEnriched, PaatettavaOpiskeluOikeus}

case class LogValintaTulos(
  hakukohdeOid: Option[String],
  valintatila: Option[String],
  ilmoittautumistila: Option[String],
  vastaanottotila: Option[String]
) {
  override def toString: String = s"Valintatulos ${hakukohdeOid.getOrElse("")}: " +
    s"valintatila: ${valintatila.getOrElse("")}, " +
    s"ilmoittautumistila: ${ilmoittautumistila.getOrElse("")}, vastaanottotila: ${vastaanottotila.getOrElse("")}"
}

case class LogHakemus(hakemusOid: String, hakemuksenTulokset: List[LogValintaTulos]) {
  override def toString: String = {
    val tulokset = s"${hakemuksenTulokset
        .map(ht => ht.toString)
        .foldLeft("")((a, b) => String.join("\n", a, b))}"
    if (tulokset.isEmpty) {
      s"Hakemus $hakemusOid, ei tuloksia "
    } else {
      s"Hakemus $hakemusOid, tulokset: $tulokset"
    }
  }
}

case class LogPaatettavaOpiskeluOikeus(oikeus: PaatettavaOpiskeluOikeus) {
  override def toString: String =
    s"""Paatettava opiskeluoikeus: (
      virtaopiskeluoikeusId: ${oikeus.virtaOpiskeluOikeusId},
      organisaatioOid: ${oikeus.organisaatioOid},
      organisaatioNimi: (fi: ${oikeus.organisaatioNimi.fi}, sv: ${oikeus.organisaatioNimi.sv}, en: fi: ${oikeus.organisaatioNimi.en}),
      virtaNimi: (fi: ${oikeus.virtaNimi.fi}, sv: ${oikeus.virtaNimi.sv}, en: fi: ${oikeus.virtaNimi.en}),
      supaNimi: (fi: ${oikeus.supaNimi.fi}, sv: ${oikeus.supaNimi.sv}, en: fi: ${oikeus.supaNimi.en})
      )""".stripMargin
}

case class LogPaatettavatOpiskeluOikeudet(hakemus: HakemusEnriched) {
  override def toString: String = {
    val oikeudet = hakemus.hakemuksenTulokset
      .filter(tulos => tulos.paatettavatOpiskeluOikeudet.nonEmpty)
      .map(tulos => {
        val oikeudet = tulos.paatettavatOpiskeluOikeudet
          .map(o => LogPaatettavaOpiskeluOikeus(o).toString)
          .foldLeft("")((a, b) => String.join("\n", a, b))
        s"Hakutoive ${tulos.hakukohdeOid}: \n $oikeudet"
      })
    if (oikeudet.nonEmpty) {
      s"Päätettävät opiskeluoikeudet hakemukselle ${hakemus.oid}: \n$oikeudet"
    } else {
      ""
    }
  }
}

class LogUtil {}

object LogUtil {
  def toValintaTulos(toive: HakutoiveenTulosEnriched): LogValintaTulos = {
    LogValintaTulos(
      toive.hakukohdeOid,
      toive.valintatila,
      toive.ilmoittautumistila.flatMap(it => it.ilmoittautumistila),
      toive.vastaanottotila
    )
  }
}
