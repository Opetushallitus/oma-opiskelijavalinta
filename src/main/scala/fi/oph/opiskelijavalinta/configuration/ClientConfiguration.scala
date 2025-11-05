package fi.oph.opiskelijavalinta.configuration

import fi.oph.opiskelijavalinta.clients.AtaruClient
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.{Bean, Configuration}
import fi.vm.sade.javautils.nio.cas.CasClient

@Configuration
class ClientConfiguration {

  @Bean
  def ataruClient(@Autowired ataruCasClient: CasClient): AtaruClient = {
    new AtaruClient(ataruCasClient)
  }
}
