package fi.oph.opiskelijavalinta.security

import fi.vm.sade.auditlog.Operation

trait AuditOperation(val name: String) extends Operation

object AuditOperation {
  case object Login extends AuditOperation("KIRJAUTUMINEN")

  case object Logout extends AuditOperation("ULOSKIRJAUTUMINEN")

  case object LinkLogin extends AuditOperation("LINKKIKIRJAUTUMINEN")

  case object LinkLogout extends AuditOperation("LINKKIULOSKIRJAUTUMINEN")

  case object HaeHakemukset extends AuditOperation("HAE HAKEMUKSET")

  case object HaeValintaTulokset extends AuditOperation("HAE VALINTATULOKSET")

  case object TallennaVastaanotto extends AuditOperation("TALLENNA VASTAANOTTO")

  case object TallennaIlmoittautuminen extends AuditOperation("TALLENNA ILMOITTAUTUMINEN")
}
