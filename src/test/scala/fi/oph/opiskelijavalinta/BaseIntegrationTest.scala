package fi.oph.opiskelijavalinta

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.github.dockerjava.api.model.{ExposedPort, HostConfig, PortBinding, Ports}
import fi.oph.opiskelijavalinta.BaseIntegrationTest.postgresPort
import fi.oph.opiskelijavalinta.clients.{AtaruClient, KoutaClient, OhjausparametritClient}
import fi.oph.opiskelijavalinta.model.{Application, DateParam, Haku, Hakukohde, Ohjausparametrit, TranslatedName}
import org.junit.jupiter.api.*
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito
import org.postgresql.ds.PGSimpleDataSource
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.SpringBootTest.{UseMainMethod, WebEnvironment}
import org.springframework.boot.test.system.{CapturedOutput, OutputCaptureExtension}
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.bean.`override`.convention.TestBean
import org.springframework.test.context.bean.`override`.mockito.{MockReset, MockitoBean}
import org.springframework.test.util.TestSocketUtils
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.{MockHttpServletRequestBuilder, MockMvcRequestBuilders}
import org.springframework.test.web.servlet.setup.{DefaultMockMvcBuilder, MockMvcBuilders, MockMvcConfigurer}
import org.springframework.web.context.WebApplicationContext
import org.testcontainers.containers.PostgreSQLContainer
import slick.jdbc.JdbcBackend.Database

class OphPostgresContainer(dockerImageName: String) extends PostgreSQLContainer[OphPostgresContainer](dockerImageName) {}

case class AuditLogEntry(operation: String, target: Map[String, Any], changes: List[Any])

object BaseIntegrationTest {

  // Vakioidaan portit testien suorituksen ajaksi. Tämä on tarpeen koska koodissa on lazy val -konfiguraatioarvoja jotka
  // eivät resetoidu testien välissä
  lazy val postgresPort = TestSocketUtils.findAvailableTcpPort
}

/**
 * Integraatiotestien base-luokka. Käynnistää ennen testejä Localstacking, Postgresin ja Rediksen.
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ExtendWith(Array(classOf[OutputCaptureExtension]))
@ActiveProfiles(Array("test"))
@DirtiesContext
@TestInstance(Lifecycle.PER_CLASS)
class BaseIntegrationTest {

  val LOG: Logger = LoggerFactory.getLogger(this.getClass)

  val POSTGRES_DATABASENAME = "oma-opiskelijavalinta"
  val POSTGRES_USERNAME     = "app"
  val POSTGRES_PASSWORD     = "app"

  val postgres: OphPostgresContainer = new OphPostgresContainer("postgres:15")
    .withDatabaseName(POSTGRES_DATABASENAME)
    .withUsername(POSTGRES_USERNAME)
    .withPassword(POSTGRES_PASSWORD)
    .withLogConsumer(frame => LOG.info(frame.getUtf8StringWithoutLineEnding))
    .withExposedPorts(5432)
    .withCreateContainerCmdModifier(m => m.withHostConfig(new HostConfig()
      .withPortBindings(new PortBinding(Ports.Binding.bindPort(postgresPort), new ExposedPort(5432)))))

  private def getDatasource =
    val ds: PGSimpleDataSource = new PGSimpleDataSource()
    ds.setServerNames(Array("localhost"))
    ds.setDatabaseName(POSTGRES_DATABASENAME)
    ds.setPortNumbers(Array(postgres.getMappedPort(5432)))
    ds.setUser(POSTGRES_USERNAME)
    ds.setPassword(POSTGRES_PASSWORD)
    ds


  // kontteja ei voi käynnistää vasta @BeforeAll-metodissa koska spring-konteksti rakennetaan ennen sitä
  val setupDone: Boolean = {
    postgres.start()
    System.setProperty("spring.datasource.url", "jdbc:postgresql://localhost:" + postgresPort + "/" + POSTGRES_DATABASENAME)

    System.setProperty("cas-service.service", "DUMMY")
    System.setProperty("cas-service.sendRenew", "false")
    System.setProperty("cas-service.key", "DUMMY")
    System.setProperty("web.url.cas", "DUMMY")
    System.setProperty("web.url.cas-login", "DUMMY_CAS_LOGIN")

    val database = Database.forDataSource(getDatasource, None)
    true
  }

  @Autowired private val context: WebApplicationContext = null

  @MockitoBean(reset = MockReset.NONE)
  val ataruClient: AtaruClient = Mockito.mock(classOf[AtaruClient])

  @MockitoBean(reset = MockReset.NONE)
  val koutaClient: KoutaClient = Mockito.mock(classOf[KoutaClient])

  @MockitoBean(reset = MockReset.NONE)
  val ohjausparametritClient: OhjausparametritClient = Mockito.mock(classOf[OhjausparametritClient])
  
  var mvc: MockMvc = null

  @BeforeAll def setup(): Unit = {
    val configurer: MockMvcConfigurer = SecurityMockMvcConfigurers.springSecurity()
    val intermediate: DefaultMockMvcBuilder = MockMvcBuilders.webAppContextSetup(context).apply(configurer)
    mvc = intermediate.build
    Mockito.when(ataruClient.getApplications("someValue"))
      .thenReturn(Right(objectMapper.writeValueAsString(Array(Application("hakemus-oid-1", "haku-oid-1", Set("hakukohde-oid-1", "hakukohde-oid-2"), "secret1")))))
    Mockito.when(koutaClient.getHaku("haku-oid-1")).thenReturn(Right(objectMapper.writeValueAsString(Haku("haku-oid-1", TranslatedName("Leikkipuiston jatkuva haku", "Samma på svenska", "Playground search")))))
    Mockito.when(koutaClient.getHakukohde("hakukohde-oid-1")).thenReturn(Right(objectMapper.writeValueAsString(Hakukohde("hakukohde-oid-1", TranslatedName("Liukumäen lisensiaatti", "", ""), TranslatedName("Leikkipuisto, Liukumäki", "", "")))))
    Mockito.when(koutaClient.getHakukohde("hakukohde-oid-2")).thenReturn(Right(objectMapper.writeValueAsString(Hakukohde("hakukohde-oid-2", TranslatedName("Hiekkalaatikon arkeologi", "", ""), TranslatedName("Leikkipuisto, Hiekkalaatikko", "", "")))))
    Mockito.when(ohjausparametritClient.getOhjausparametritForHaku("haku-oid-1")).thenReturn(Right(objectMapper.writeValueAsString(Ohjausparametrit(
      PH_HKP = Some(DateParam(Some(1799657520000L))),
      PH_IP = None,
      PH_VTJH = None,
      PH_EVR = None,
      PH_OPVP = None
    ))))
  }

  @AfterAll def teardown(): Unit = {
    postgres.stop()
  }

  var capturedOutput: CapturedOutput = null
  var outputLength = 0;

  def getLatestAuditLogEntry: AuditLogEntry =
    val output = capturedOutput.subSequence(outputLength, capturedOutput.length()).toString
      .split("\n")
      .filter(s => s.contains(".AuditLog"))
      .map(s => s.split("\\.AuditLog(\\s)+:(\\s)+")(1))
      .last
    val entry = objectMapper.readValue(output, classOf[AuditLogEntry])
    outputLength = capturedOutput.length()
    entry

  @BeforeEach def beforeEach(output: CapturedOutput): Unit =
    capturedOutput = output
    outputLength = output.length()

  val objectMapper: ObjectMapper =
    val mapper = new ObjectMapper()
    mapper.registerModule(DefaultScalaModule)
    mapper.registerModule(new JavaTimeModule())
    mapper.registerModule(new Jdk8Module()) // tämä on java.util.Optional -kenttiä varten
    mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
    mapper.configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false)
    mapper.configure(SerializationFeature.INDENT_OUTPUT, true)
    mapper

  def jsonPostString(path: String, body: String): MockHttpServletRequestBuilder =
    MockMvcRequestBuilders
      .post(path)
      .contentType(MediaType.APPLICATION_JSON_VALUE)
      .accept(MediaType.APPLICATION_JSON_VALUE)
      .content(body)

  def jsonPost(path: String, body: Any): MockHttpServletRequestBuilder =
    MockMvcRequestBuilders
      .post(path)
      .contentType(MediaType.APPLICATION_JSON_VALUE)
      .accept(MediaType.APPLICATION_JSON_VALUE)
      .content(objectMapper.writeValueAsString(body))
}
