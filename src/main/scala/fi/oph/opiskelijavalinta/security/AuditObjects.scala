package fi.oph.opiskelijavalinta.security

import fi.oph.opiskelijavalinta.model.HakutoiveenTulos

case class AuditValintaTulos(
  hakukohdeOid: Option[String],
  valintatila: Option[String],
  ilmoittautumistila: Option[String],
  vastaanottotila: Option[String]
)

case class AuditHakemus(hakemusOid: String, hakemuksenTulokset: List[AuditValintaTulos])

class AuditObjects {}

object AuditObjects {
  def toValintaTulos(toive: HakutoiveenTulos): AuditValintaTulos = {
    AuditValintaTulos(
      toive.hakukohdeOid,
      toive.valintatila,
      toive.ilmoittautumistila.flatMap(it => it.ilmoittautumistila),
      toive.vastaanottotila
    )
  }
}
