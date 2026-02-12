package fi.oph.opiskelijavalinta.util

import fi.oph.opiskelijavalinta.model.HakutoiveenTulosEnriched

case class LogValintaTulos(
  hakukohdeOid: Option[String],
  valintatila: Option[String],
  ilmoittautumistila: Option[String],
  vastaanottotila: Option[String]
) {
  override def toString: String = s"Valintatulos ${hakukohdeOid.getOrElse("")}:, " +
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
