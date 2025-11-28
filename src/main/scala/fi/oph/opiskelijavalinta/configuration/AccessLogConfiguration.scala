package fi.oph.opiskelijavalinta.configuration

import ch.qos.logback.access.tomcat.LogbackValve
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory
import org.springframework.boot.web.server.WebServerFactoryCustomizer
import org.springframework.context.annotation.{Bean, Configuration, Profile}
import org.apache.catalina.Context
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty

import java.io.IOException
import java.nio.file.{Files, Paths, StandardCopyOption}

@Configuration
@Profile(Array("default"))
@ConditionalOnProperty(name = Array("logback.access"))
class AccessLogConfiguration extends WebServerFactoryCustomizer[TomcatServletWebServerFactory] {

  val CONFIG_FILE = "logback-access.xml"

  override def customize(tomcat: TomcatServletWebServerFactory): Unit = {
    tomcat.addContextCustomizers((context: Context) => {
      val logbackValve = new LogbackValve
      logbackValve.setFilename(CONFIG_FILE)
      logbackValve.setAsyncSupported(true)
      context.getPipeline.addValve(logbackValve)
    })
  }

}
