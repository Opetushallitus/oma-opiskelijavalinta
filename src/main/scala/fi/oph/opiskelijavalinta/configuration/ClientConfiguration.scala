package fi.oph.opiskelijavalinta.configuration

import fi.oph.opiskelijavalinta.clients.{AtaruClient, KoutaClient}
import org.springframework.beans.factory.annotation.{Autowired, Qualifier}
import org.springframework.context.annotation.{Bean, Configuration}
import fi.vm.sade.javautils.nio.cas.CasClient

@Configuration
class ClientConfiguration {

  @Bean
  def ataruClient(@Autowired @Qualifier("ataruCasClient") ataruCasClient: CasClient): AtaruClient = {
    new AtaruClient(ataruCasClient)
  }

  @Bean
  def koutaClient(@Autowired @Qualifier("koutaCasClient") koutaCasClient: CasClient): KoutaClient = {
    new KoutaClient(koutaCasClient)
  }

  @Bean
  def ohjausparametritClient(): OhjausparametritClient = {
    new OhjausparametritClient
  }

  @Bean
  def vtsClient(@Autowired @Qualifier("vtsCasClient") vtsCasClient: CasClient): ValintaTulosServiceClient = {
    new ValintaTulosServiceClient(vtsCasClient)
  }
}
