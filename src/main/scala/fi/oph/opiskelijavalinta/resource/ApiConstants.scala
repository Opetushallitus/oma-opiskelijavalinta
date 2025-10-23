package fi.oph.opiskelijavalinta.resource

/**
 * API-endpointtien polkuihin ja Swagger-kuvauksiin liittyvät vakiot
 */
object ApiConstants {

  final val API_PREFIX                                      = "/api"

  final val LOGIN_PATH                                      = API_PREFIX + "/login"
  final val CAS_TICKET_VALIDATION_PATH                      = LOGIN_PATH + "/j_spring_cas_security_check"
  final val HEALTHCHECK_PATH                                = API_PREFIX + "/healthcheck"
  final val SESSION_PATH                                    = API_PREFIX + "/session"

}
