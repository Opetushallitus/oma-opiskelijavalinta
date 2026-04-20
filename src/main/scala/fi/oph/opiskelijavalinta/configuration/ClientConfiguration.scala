package fi.oph.opiskelijavalinta.configuration

import fi.oph.opiskelijavalinta.clients.{
  AtaruClient,
  KoodistoClient,
  KoutaClient,
  LokalisointiClient,
  OhjausparametritClient,
  OppijanTunnistusClient,
  ValintaTulosServiceClient
}
import org.springframework.beans.factory.annotation.{Autowired, Qualifier}
import org.springframework.context.annotation.{Bean, Configuration}
import fi.vm.sade.javautils.nio.cas.CasClient
import org.asynchttpclient.AsyncHttpClient

import scala.concurrent.ExecutionContext

@Configuration
class ClientConfiguration(timeouts: ClientTimeoutProperties) {

  @Bean
  def ataruClient(
    @Autowired @Qualifier("ataruCasClient") ataruCasClient: CasClient,
    httpExecutionContext: ExecutionContext
  ): AtaruClient = {
    new AtaruClient(ataruCasClient, httpExecutionContext, timeouts.ataru)
  }

  @Bean
  def koodistoClient(asyncHttpClient: AsyncHttpClient, httpExecutionContext: ExecutionContext): KoodistoClient = {
    new KoodistoClient(asyncHttpClient, httpExecutionContext, timeouts.koodisto)
  }

  @Bean
  def koutaClient(
    @Autowired @Qualifier("koutaCasClient") koutaCasClient: CasClient,
    httpExecutionContext: ExecutionContext
  ): KoutaClient = {
    new KoutaClient(koutaCasClient, httpExecutionContext, timeouts.kouta)
  }

  @Bean
  def lokalisointiClient(
    asyncHttpClient: AsyncHttpClient,
    httpExecutionContext: ExecutionContext
  ): LokalisointiClient =
    new LokalisointiClient(asyncHttpClient, httpExecutionContext, timeouts.lokalisointi)

  @Bean
  def ohjausparametritClient(
    asyncHttpClient: AsyncHttpClient,
    httpExecutionContext: ExecutionContext
  ): OhjausparametritClient = {
    new OhjausparametritClient(asyncHttpClient, httpExecutionContext, timeouts.ohjausparametrit)
  }

  @Bean
  def oppijanTunnistusClient(
    @Autowired @Qualifier("oppijanTunnistusCasClient") oppijanTunnistusCasClient: CasClient,
    httpExecutionContext: ExecutionContext
  ): OppijanTunnistusClient = {
    new OppijanTunnistusClient(oppijanTunnistusCasClient, httpExecutionContext, timeouts.oppijanTunnistus)
  }

  @Bean
  def vtsClient(
    @Autowired @Qualifier("vtsCasClient") vtsCasClient: CasClient,
    httpExecutionContext: ExecutionContext
  ): ValintaTulosServiceClient = {
    new ValintaTulosServiceClient(vtsCasClient, httpExecutionContext, timeouts.vts)
  }
}
