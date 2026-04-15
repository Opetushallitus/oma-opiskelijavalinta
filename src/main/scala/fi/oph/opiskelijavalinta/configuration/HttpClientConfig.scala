package fi.oph.opiskelijavalinta.configuration

import org.asynchttpclient.*
import org.springframework.context.annotation.{Bean, Configuration}

import java.util.concurrent.ThreadPoolExecutor

@Configuration
class HttpClientConfig {

  @Bean(destroyMethod = "close")
  def asyncHttpClient(): AsyncHttpClient = {

    val config = new DefaultAsyncHttpClientConfig.Builder()
      .setMaxConnections(500)
      .setConnectTimeout(java.time.Duration.ofSeconds(10))
      .setRequestTimeout(java.time.Duration.ofSeconds(5))
      .setMaxRedirects(5)
      .build()

    new DefaultAsyncHttpClient(config)
  }
}
