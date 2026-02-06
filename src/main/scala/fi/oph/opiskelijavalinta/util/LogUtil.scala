package fi.oph.opiskelijavalinta.util

import fi.oph.opiskelijavalinta.model.HakutoiveenTulosEnriched

case class LogValintaTulos(
  hakukohdeOid: Option[String],
  valintatila: Option[String],
  ilmoittautumistila: Option[String],
  vastaanottotila: Option[String]
)

case class LogHakemus(hakemusOid: String, hakemuksenTulokset: List[LogValintaTulos])

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
