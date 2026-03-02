package fi.oph.opiskelijavalinta.resource

/**
 * API-endpointtien polkuihin ja Swagger-kuvauksiin liittyvät vakiot
 */
object ApiConstants {

  final val API_PREFIX = "/api"

  final val LOGIN_PATH                 = API_PREFIX + "/login"
  final val LINK_LOGIN_PATH            = API_PREFIX + "/link-login"
  final val LINK_LOGOUT_PATH           = API_PREFIX + "/link-logout"
  final val USER_PATH                  = API_PREFIX + "/user"
  final val CAS_TICKET_VALIDATION_PATH = LOGIN_PATH + "/j_spring_cas_security_check"
  final val HEALTHCHECK_PATH           = API_PREFIX + "/healthcheck"
  final val SESSION_PATH               = API_PREFIX + "/session"
  final val HAKEMUKSET_PATH            = API_PREFIX + "/hakemukset"
  final val ILMOITTAUTUMINEN_PATH      = API_PREFIX + "/ilmoittautuminen"
  final val VASTAANOTTO_PATH           = API_PREFIX + "/vastaanotto"
  final val VALINTATULOS_PATH          = API_PREFIX + "/valintatulos"
}
