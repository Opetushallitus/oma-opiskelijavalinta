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
class ClientConfiguration {

  @Bean
  def ataruClient(
    @Autowired @Qualifier("ataruCasClient") ataruCasClient: CasClient,
    httpExecutionContext: ExecutionContext
  ): AtaruClient = {
    new AtaruClient(ataruCasClient, httpExecutionContext)
  }

  @Bean
  def koodistoClient(asyncHttpClient: AsyncHttpClient, httpExecutionContext: ExecutionContext): KoodistoClient = {
    new KoodistoClient(asyncHttpClient, httpExecutionContext)
  }

  @Bean
  def koutaClient(
    @Autowired @Qualifier("koutaCasClient") koutaCasClient: CasClient,
    httpExecutionContext: ExecutionContext
  ): KoutaClient = {
    new KoutaClient(koutaCasClient, httpExecutionContext)
  }

  @Bean
  def lokalisointiClient(
    asyncHttpClient: AsyncHttpClient,
    httpExecutionContext: ExecutionContext
  ): LokalisointiClient =
    new LokalisointiClient(asyncHttpClient, httpExecutionContext)

  @Bean
  def ohjausparametritClient(
    asyncHttpClient: AsyncHttpClient,
    httpExecutionContext: ExecutionContext
  ): OhjausparametritClient = {
    new OhjausparametritClient(asyncHttpClient, httpExecutionContext)
  }

  @Bean
  def oppijanTunnistusClient(
    @Autowired @Qualifier("oppijanTunnistusCasClient") oppijanTunnistusCasClient: CasClient,
    httpExecutionContext: ExecutionContext
  ): OppijanTunnistusClient = {
    new OppijanTunnistusClient(oppijanTunnistusCasClient, httpExecutionContext)
  }

  @Bean
  def vtsClient(
    @Autowired @Qualifier("vtsCasClient") vtsCasClient: CasClient,
    httpExecutionContext: ExecutionContext
  ): ValintaTulosServiceClient = {
    new ValintaTulosServiceClient(vtsCasClient, httpExecutionContext)
  }
}
