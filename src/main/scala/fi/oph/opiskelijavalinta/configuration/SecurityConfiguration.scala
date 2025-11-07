package fi.oph.opiskelijavalinta.configuration


import fi.oph.opiskelijavalinta.resource.ApiConstants
import org.apereo.cas.client.session.{SessionMappingStorage, SingleSignOutFilter}
import org.apereo.cas.client.validation.{Cas20ProxyTicketValidator, TicketValidator}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.{Bean, Configuration}
import org.springframework.core.annotation.Order
import org.springframework.core.env.Environment
import org.springframework.http.{HttpMethod, HttpStatus}
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.cas.ServiceProperties
import org.springframework.security.cas.authentication.CasAuthenticationProvider
import org.springframework.security.cas.web.{CasAuthenticationEntryPoint, CasAuthenticationFilter}
import org.springframework.security.config.Customizer
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configurers.ExceptionHandlingConfigurer
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.HttpStatusEntryPoint
import org.springframework.security.web.context.{HttpSessionSecurityContextRepository, SecurityContextRepository}
import org.springframework.session.jdbc.config.annotation.web.http.EnableJdbcHttpSession
import org.springframework.session.web.http.{CookieSerializer, DefaultCookieSerializer}

/**
 *
 */
@Configuration
@EnableWebSecurity
@EnableJdbcHttpSession(tableName = "SPRING_SESSION")
class SecurityConfiguration {

  val LOG: Logger = LoggerFactory.getLogger(classOf[SecurityConfiguration]);
  private final val SPRING_CAS_SECURITY_CHECK_PATH = "/j_spring_cas_security_check"

  @Bean
  def securityContextRepository(): HttpSessionSecurityContextRepository = {
    val httpSessionSecurityContextRepository = new HttpSessionSecurityContextRepository()
    httpSessionSecurityContextRepository
  }

  @Bean
  @Order(2)
  def appSecurityFilterChain(http: HttpSecurity,
                            casAuthenticationEntryPoint: CasAuthenticationEntryPoint,
                            authenticationFilter: CasAuthenticationFilter,
                            sessionMappingStorage: SessionMappingStorage,
                            securityContextRepository: SecurityContextRepository,
                            sessionTimeoutFilter: SessionTimeoutFilter): SecurityFilterChain =
    val SWAGGER_WHITELIST = List(
      "/swagger-resources",
      "/swagger-resources/**",
      "/swagger-ui.html",
      "/openapi/v3/api-docs/**",
      "/swagger-ui/**",
      "/swagger"
    )
    http
      .authorizeHttpRequests(requests => requests
        .requestMatchers(HttpMethod.GET, ApiConstants.HEALTHCHECK_PATH, "/api/login", "/static/**", "/actuator/health")
        .permitAll()
        .requestMatchers(SWAGGER_WHITELIST*)
        .permitAll()
        // Allow frontend entry point + assets
        .requestMatchers(
          HttpMethod.GET,
          "/",
          "/index.html",
          "/assets/**",
          "/js/**",
          "/oma-opiskelijavalinta",
          "/oma-opiskelijavalinta/"
        ).permitAll()
        .anyRequest
        .fullyAuthenticated)
      .csrf(c => c.disable())
      .cors(Customizer.withDefaults)
      .exceptionHandling(c => c.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
      .addFilterBefore(singleLogoutFilter(sessionMappingStorage), classOf[CasAuthenticationFilter])
      .addFilterBefore(sessionTimeoutFilter, classOf[CasAuthenticationFilter])
      .addFilter(authenticationFilter)
      .securityContext(securityContext => securityContext
        .requireExplicitSave(true)
        .securityContextRepository(securityContextRepository))
      .requestCache(cache => cache.disable()) // Don't save original request after login redirect, redirect to the default entry point
      .logout(logout =>
        logout.logoutUrl("/logout")
          .deleteCookies("JSESSIONID"))
      .build()

  @Bean
  def cookieSerializer(): CookieSerializer =
    val serializer = new DefaultCookieSerializer()
    serializer.setUseSecureCookie(true)
    serializer.setCookieName("JSESSIONID")
    serializer

  @Bean
  def serviceProperties(@Value("${cas-service.service}") service: String, @Value("${cas-service.sendRenew}") sendRenew: Boolean): ServiceProperties =
    val serviceProperties = new ServiceProperties()
    serviceProperties.setService(service + ApiConstants.CAS_TICKET_VALIDATION_PATH)
    serviceProperties.setSendRenew(false)
    serviceProperties.setAuthenticateAllArtifacts(true)
    serviceProperties

  //
  // CAS authentication provider (authentication manager)
  //
  @Bean
  def casAuthenticationProvider(serviceProperties: ServiceProperties, ticketValidator: TicketValidator, environment: Environment, @Value("${cas-service.key}") key: String): CasAuthenticationProvider =
    //val host = environment.getProperty("host.alb", environment.getRequiredProperty("host.virkailija"))
    val casAuthenticationProvider = CasAuthenticationProvider()
    casAuthenticationProvider.setAuthenticationUserDetailsService(new OppijaUserDetails)
    casAuthenticationProvider.setServiceProperties(serviceProperties)
    casAuthenticationProvider.setTicketValidator(ticketValidator)
    casAuthenticationProvider.setKey(key)
    casAuthenticationProvider

  @Bean
  def ticketValidator(environment: Environment): TicketValidator =
    val ticketValidator = new Cas20ProxyTicketValidator(environment.getRequiredProperty("web.url.cas"))
    ticketValidator.setAcceptAnyProxy(true)
    ticketValidator

  //
  // CAS filter
  //
  @Bean
  def casAuthenticationFilter(authenticationManager: AuthenticationManager, serviceProperties: ServiceProperties, securityContextRepository: SecurityContextRepository): CasAuthenticationFilter =
    val casAuthenticationFilter = CasAuthenticationFilter()
    casAuthenticationFilter.setAuthenticationManager(authenticationManager)
    casAuthenticationFilter.setServiceProperties(serviceProperties)
    casAuthenticationFilter.setFilterProcessesUrl(ApiConstants.CAS_TICKET_VALIDATION_PATH)
    casAuthenticationFilter.setSecurityContextRepository(securityContextRepository)
    casAuthenticationFilter

  //
  // CAS entry point
  //
  @Bean def casAuthenticationEntryPoint(environment: Environment, serviceProperties: ServiceProperties): CasAuthenticationEntryPoint =
    val casAuthenticationEntryPoint = new CasAuthenticationEntryPoint()
    casAuthenticationEntryPoint.setLoginUrl(environment.getRequiredProperty("web.url.cas-login"))
    casAuthenticationEntryPoint.setServiceProperties(serviceProperties)
    casAuthenticationEntryPoint

  @Bean
  def authenticationManager(http: HttpSecurity, casAuthenticationProvider: CasAuthenticationProvider): AuthenticationManager =
    http.getSharedObject(classOf[AuthenticationManagerBuilder])
      .authenticationProvider(casAuthenticationProvider)
      .build()

  // api joka ohjaa tarvittaessa kirjautumattoman käyttäjän cas loginiin
  @Bean
  @Order(1)
  def apiLoginFilterChain(http: HttpSecurity, casAuthenticationEntryPoint: CasAuthenticationEntryPoint): SecurityFilterChain = {
    http
      .securityMatcher("/api/login")
      .authorizeHttpRequests(requests =>
        requests.requestMatchers(SPRING_CAS_SECURITY_CHECK_PATH).permitAll() // päästetään läpi cas-logout
          .anyRequest.fullyAuthenticated)
      .exceptionHandling(c => c.authenticationEntryPoint(casAuthenticationEntryPoint))
      .build()
  }

  //
  // Käsitellään CASilta tuleva SLO-pyyntö
  //
  @Bean
  def singleLogoutFilter(sessionMappingStorage: SessionMappingStorage): SingleSignOutFilter = {
    SingleSignOutFilter.setSessionMappingStorage(sessionMappingStorage)
    val singleSignOutFilter: SingleSignOutFilter = new SingleSignOutFilter();
    singleSignOutFilter.setIgnoreInitConfiguration(true);
    singleSignOutFilter
  }

}

