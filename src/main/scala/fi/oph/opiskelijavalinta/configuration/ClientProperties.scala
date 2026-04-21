package fi.oph.opiskelijavalinta.configuration

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "http.client")
class HttpClientProperties {
  var maxConnections: Int        = 500
  var maxConnectionsPerHost: Int = 200
}

@Component
@ConfigurationProperties(prefix = "threadpool.http")
class HttpThreadPoolProperties {
  var coreSize: Int          = 80
  var maxSize: Int           = 180
  var queueSize: Int         = 1000
  var keepAliveSeconds: Long = 60L
}

@Component
@ConfigurationProperties(prefix = "clients.timeout")
class ClientTimeoutProperties {
  var ataru: Int            = 60
  var vts: Int              = 60
  var kouta: Int            = 30
  var onr: Int              = 10
  var ohjausparametrit: Int = 30
  var oppijanTunnistus: Int = 30
  var koodisto: Int         = 120
  var lokalisointi: Int     = 5
}
