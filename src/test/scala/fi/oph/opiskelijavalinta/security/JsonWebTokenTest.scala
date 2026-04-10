package fi.oph.opiskelijavalinta.security

import fi.oph.opiskelijavalinta.TestUtils.PERSON_OID
import org.junit.jupiter.api.Assertions.{assertFalse, assertThrows}
import org.junit.jupiter.api.Test

class JsonWebTokenTest {

  val oiliToken  = OiliJsonWebToken("verylongplaceholdertosatisfyminimumlimit")
  val migriToken = MigriJsonWebToken("verylongplaceholdertosatisfyminimumlimit2")

  @Test
  def successfullyEncodes(): Unit = {
    assertFalse(oiliToken.createOiliJWT(PERSON_OID).isBlank)
    assertFalse(migriToken.createMigriJWT(PERSON_OID).isBlank)
  }

  @Test
  def throwsExceptionWhenMigriInitializedWithTooShortKey(): Unit = {
    assertThrows(classOf[RuntimeException], () => MigriJsonWebToken("dummy"))
  }

  @Test
  def throwsExceptionWhenOiliInitializedWithTooShortKey(): Unit = {
    assertThrows(classOf[RuntimeException], () => OiliJsonWebToken("dummy"))
  }

}
