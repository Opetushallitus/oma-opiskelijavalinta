package fi.oph.opiskelijavalinta.configuration

import fi.oph.opiskelijavalinta.Constants
import fi.vm.sade.javautils.nio.cas.{CasClient, CasClientBuilder, CasConfig}
import fi.oph.opiskelijavalinta.resource.ApiConstants
import fi.oph.opiskelijavalinta.resource.ApiConstants.{LINK_LOGIN_PATH, LINK_LOGOUT_PATH}
import fi.oph.opiskelijavalinta.security.{
  AuditLog,
  AuditOperation,
  AuditedSingleSignOutFilter,
  LinkAuthenticationProvider,
  OppijaUserDetails
}
import fi.oph.opiskelijavalinta.service.LinkVerificationService
import jakarta.servlet.http.{HttpServletRequest, HttpServletResponse}
import jakarta.servlet.{Filter, FilterChain, ServletRequest, ServletResponse}
import org.apereo.cas.client.session.{SessionMappingStorage, SingleSignOutFilter}
import org.apereo.cas.client.validation.{Cas20ProxyTicketValidator, TicketValidator}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.{Bean, Configuration, Primary}
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
import org.springframework.security.core.Authentication
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.access.intercept.AuthorizationFilter
import org.springframework.security.web.authentication.HttpStatusEntryPoint
import org.springframework.security.web.authentication.logout.{LogoutHandler, LogoutSuccessHandler}
import org.springframework.security.web.context.{HttpSessionSecurityContextRepository, SecurityContextRepository}
import org.springframework.session.FlushMode
import org.springframework.session.jdbc.config.annotation.web.http.EnableJdbcHttpSession
import org.springframework.session.web.http.{CookieSerializer, DefaultCookieSerializer}

@Configuration
@EnableWebSecurity
@EnableJdbcHttpSession(tableName = "SPRING_SESSION", flushMode = FlushMode.IMMEDIATE)
class SecurityConfiguration {

  val LOG: Logger                                  = LoggerFactory.getLogger(classOf[SecurityConfiguration]);
  final private val SPRING_CAS_SECURITY_CHECK_PATH = "/j_spring_cas_security_check"

  @Value("${host.virkailija}")
  val opintopolku_virkailija_domain: String = null

  @Value("${oma-opiskelijavalinta.cas.username}")
  val cas_username: String = null

  @Value("${oma-opiskelijavalinta.cas.password}")
  val cas_password: String = null

  @Bean
  def securityContextRepository(): HttpSessionSecurityContextRepository = {
    val httpSessionSecurityContextRepository = new HttpSessionSecurityContextRepository()
    httpSessionSecurityContextRepository
  }

  @Bean(Array("ataruCasClient"))
  def createAtaruCasClient(): CasClient = {
    CasClientBuilder.build(
      CasConfig
        .CasConfigBuilder(
          cas_username,
          cas_password,
          s"https://$opintopolku_virkailija_domain/cas",
          s"https://$opintopolku_virkailija_domain/lomake-editori",
          Constants.CALLER_ID,
          Constants.CALLER_ID,
          "/auth/cas"
        )
        .setJsessionName("ring-session")
        .setNumberOfRetries(2)
        .build()
    )
  }

  @Bean(Array("koutaCasClient"))
  def createKoutaCasClient(): CasClient = {
    CasClientBuilder.build(
      CasConfig
        .CasConfigBuilder(
          cas_username,
          cas_password,
          s"https://$opintopolku_virkailija_domain/cas",
          s"https://$opintopolku_virkailija_domain/kouta-internal",
          Constants.CALLER_ID,
          Constants.CALLER_ID,
          "/auth/login"
        )
        .setJsessionName("session")
        .setNumberOfRetries(2)
        .build()
    )
  }

  @Bean(Array("oppijanTunnistusCasClient"))
  def createOppijanTunnistusCasClient(): CasClient = {
    CasClientBuilder.build(
      CasConfig
        .CasConfigBuilder(
          cas_username,
          cas_password,
          s"https://$opintopolku_virkailija_domain/cas",
          s"https://$opintopolku_virkailija_domain/oppijan-tunnistus",
          Constants.CALLER_ID,
          Constants.CALLER_ID,
          "/auth/cas"
        )
        .setJsessionName("ring-session")
        .setNumberOfRetries(2)
        .build()
    )
  }

  @Bean(Array("vtsCasClient"))
  def createVtsCasClient(): CasClient = {
    CasClientBuilder.build(
      CasConfig
        .CasConfigBuilder(
          cas_username,
          cas_password,
          s"https://$opintopolku_virkailija_domain/cas",
          s"https://$opintopolku_virkailija_domain/valinta-tulos-service",
          Constants.CALLER_ID,
          Constants.CALLER_ID,
          "/auth/login"
        )
        .setJsessionName("session")
        .setNumberOfRetries(2)
        .build()
    )
  }

  private def isFrontEndRoute: String => Boolean = path =>
    path.equals("/index.html") || path.equals("/") || path.startsWith("/token") || path.startsWith("/redirect")

  @Bean
  def frontendResourceFilter: Filter = (request: ServletRequest, response: ServletResponse, chain: FilterChain) => {
    LOG.debug(
      s"FrontendResourceFilter: ${request.getRemoteAddr} ${request.asInstanceOf[HttpServletRequest].getRequestURI}"
    )
    val req         = request.asInstanceOf[HttpServletRequest]
    val res         = response.asInstanceOf[HttpServletResponse]
    val contextPath = req.getContextPath
    val path        = req.getRequestURI.stripPrefix(contextPath)
    val queryString = Option(req.getQueryString).map(q => s"?$q").getOrElse("")
    val isForwarded = request.getAttribute("custom.forwarded") != null
    if (!isForwarded && isFrontEndRoute(path)) {
      LOG.debug(s"Forwarding to index.html")
      // Lisätään attribuutti, jotta voidaan välttää redirect-looppi edellisessä haarassa
      request.setAttribute("custom.forwarded", true)
      // Forwardoidaan frontend-pyyntö html-tiedostoon
      request.getRequestDispatcher("/index.html").forward(request, response)
    } else {
      LOG.debug(s"continue filter chain for path: $path")
      chain.doFilter(request, response)
    }
  }

  @Bean
  @Order(2)
  def appSecurityFilterChain(
    http: HttpSecurity,
    casAuthenticationEntryPoint: CasAuthenticationEntryPoint,
    authenticationFilter: CasAuthenticationFilter,
    sessionMappingStorage: SessionMappingStorage,
    securityContextRepository: SecurityContextRepository,
    sessionTimeoutFilter: SessionTimeoutFilter
  ): SecurityFilterChain =
    val SWAGGER_WHITELIST = List(
      "/swagger-resources",
      "/swagger-resources/**",
      "/swagger-ui.html",
      "/openapi/v3/api-docs/**",
      "/swagger-ui/**",
      "/swagger"
    )
    http
      .authorizeHttpRequests(requests =>
        requests
          .requestMatchers(
            HttpMethod.GET,
            ApiConstants.HEALTHCHECK_PATH,
            "/api/login",
            "/static/**",
            "/actuator/health"
          )
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
            "/token/**",
            "/logged-out"
          )
          .permitAll()
          .requestMatchers(
            HttpMethod.POST,
            LINK_LOGIN_PATH
          )
          .permitAll()
          .anyRequest
          .fullyAuthenticated
      )
      .csrf(c => c.disable())
      .cors(Customizer.withDefaults)
      .exceptionHandling(c => c.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
      .addFilterBefore(singleLogoutFilter(sessionMappingStorage), classOf[CasAuthenticationFilter])
      .addFilterBefore(sessionTimeoutFilter, classOf[CasAuthenticationFilter])
      .addFilter(authenticationFilter)
      /* Tehdään ohjaukset käyttöliittymään vasta koko CAS-autentikaation (ja mahdollisen login-uudellenohjauksen) jälkeen.
       * Huom! classOf[CasAuthenticationFilter] ei toimi integraatiotesteissä, koska silloin frontendResourceFilter
       * ajetaan ennen kuin koko CAS-autentikaatiota on tehty, ja koska MockMvc ei aja forwardointeja
       * filter chainin läpi.
       */
      .addFilterAfter(frontendResourceFilter, classOf[AuthorizationFilter])
      .securityContext(securityContext =>
        securityContext
          .requireExplicitSave(true)
          .securityContextRepository(securityContextRepository)
      )
      .requestCache(cache => cache.disable())
      .logout(logout =>
        logout
          .logoutUrl(LINK_LOGOUT_PATH)
          .addLogoutHandler(linkLogoutHandler())
          .invalidateHttpSession(true)
          .clearAuthentication(true)
          .deleteCookies("JSESSIONID")
          .logoutSuccessHandler((request, response, authentication) => response.setStatus(HttpServletResponse.SC_OK))
      )
      .build()

  @Bean
  def cookieSerializer(): CookieSerializer =
    val serializer = new DefaultCookieSerializer()
    serializer.setUseSecureCookie(true)
    serializer.setCookieName("JSESSIONID")
    serializer

  @Bean
  def serviceProperties(
    @Value("${cas-service.service}") service: String,
    @Value("${cas-service.sendRenew}") sendRenew: Boolean
  ): ServiceProperties =
    val serviceProperties = new ServiceProperties()
    serviceProperties.setService(service + ApiConstants.CAS_TICKET_VALIDATION_PATH)
    serviceProperties.setSendRenew(false)
    serviceProperties.setAuthenticateAllArtifacts(true)
    serviceProperties

  //
  // CAS authentication provider (authentication manager)
  //
  @Bean
  def casAuthenticationProvider(
    serviceProperties: ServiceProperties,
    ticketValidator: TicketValidator,
    environment: Environment,
    @Value("${cas-service.key}") key: String
  ): CasAuthenticationProvider =
    // val host = environment.getProperty("host.alb", environment.getRequiredProperty("host.virkailija"))
    val casAuthenticationProvider = CasAuthenticationProvider()
    casAuthenticationProvider.setAuthenticationUserDetailsService(new OppijaUserDetails)
    casAuthenticationProvider.setServiceProperties(serviceProperties)
    casAuthenticationProvider.setTicketValidator(ticketValidator)
    casAuthenticationProvider.setKey(key)
    casAuthenticationProvider

  @Bean
  def linkAuthenticationProvider(
    linkVerificationService: LinkVerificationService
  ): LinkAuthenticationProvider =
    new LinkAuthenticationProvider(linkVerificationService)

  @Bean
  def ticketValidator(environment: Environment): TicketValidator =
    val ticketValidator = new Cas20ProxyTicketValidator(environment.getRequiredProperty("web.url.cas"))
    ticketValidator.setAcceptAnyProxy(true)
    ticketValidator

  //
  // CAS filter
  //
  @Bean
  def casAuthenticationFilter(
    authenticationManager: AuthenticationManager,
    serviceProperties: ServiceProperties,
    securityContextRepository: SecurityContextRepository
  ): CasAuthenticationFilter =
    val casAuthenticationFilter = CasAuthenticationFilter()
    casAuthenticationFilter.setAuthenticationManager(authenticationManager)
    casAuthenticationFilter.setServiceProperties(serviceProperties)
    casAuthenticationFilter.setFilterProcessesUrl(ApiConstants.CAS_TICKET_VALIDATION_PATH)
    casAuthenticationFilter.setSecurityContextRepository(securityContextRepository)
    casAuthenticationFilter

  //
  // CAS entry point
  //
  @Bean def casAuthenticationEntryPoint(
    environment: Environment,
    serviceProperties: ServiceProperties
  ): CasAuthenticationEntryPoint =
    val casAuthenticationEntryPoint = new CasAuthenticationEntryPoint()
    casAuthenticationEntryPoint.setLoginUrl(environment.getRequiredProperty("web.url.cas-login"))
    casAuthenticationEntryPoint.setServiceProperties(serviceProperties)
    casAuthenticationEntryPoint

  @Bean
  @Primary
  def authenticationManager(
    http: HttpSecurity,
    casAuthenticationProvider: CasAuthenticationProvider
  ): AuthenticationManager =
    http
      .getSharedObject(classOf[AuthenticationManagerBuilder])
      .authenticationProvider(casAuthenticationProvider)
      .build()

  @Bean(Array("linkAuthenticationManager"))
  def linkAuthenticationManager(linkAuthenticationProvider: LinkAuthenticationProvider): AuthenticationManager =
    new org.springframework.security.authentication.ProviderManager(
      java.util.List.of(linkAuthenticationProvider)
    )

  @Bean
  def linkLogoutHandler(): LogoutHandler =
    (request: HttpServletRequest, response: HttpServletResponse, authentication: Authentication) => {

      if (authentication != null) {
        AuditLog.log(request, Map.empty, AuditOperation.LinkLogout, None)
      }
    }

  // api joka ohjaa tarvittaessa kirjautumattoman käyttäjän cas loginiin
  @Bean
  @Order(1)
  def apiLoginFilterChain(
    http: HttpSecurity,
    casAuthenticationEntryPoint: CasAuthenticationEntryPoint
  ): SecurityFilterChain = {
    http
      .securityMatcher("/api/login")
      .authorizeHttpRequests(requests =>
        requests
          .requestMatchers(SPRING_CAS_SECURITY_CHECK_PATH)
          .permitAll() // päästetään läpi cas-logout
          .anyRequest
          .fullyAuthenticated
      )
      .exceptionHandling(c => c.authenticationEntryPoint(casAuthenticationEntryPoint))
      .build()
  }

  //
  // Käsitellään CASilta tuleva SLO-pyyntö
  //
  @Bean
  def singleLogoutFilter(sessionMappingStorage: SessionMappingStorage): Filter = {
    SingleSignOutFilter.setSessionMappingStorage(sessionMappingStorage)
    val singleSignOutFilter: SingleSignOutFilter = new SingleSignOutFilter()
    singleSignOutFilter.setIgnoreInitConfiguration(true)
    new AuditedSingleSignOutFilter(singleSignOutFilter)
  }

}
