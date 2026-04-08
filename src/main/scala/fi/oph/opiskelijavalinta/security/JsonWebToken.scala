package fi.oph.opiskelijavalinta.security

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import pdi.jwt.{Jwt, JwtAlgorithm}

import scala.collection.Seq
import scala.util.{Failure, Success, Try}

val EXPIRATION_TIME: Int               = 3600 * 2 * 1000
val MINIMUM_SECRET_LENGTH_IN_BITS: Int = 256

case class OiliJWT(hakijaOid: String, expires: Long)

case class MigriJWT(hakijaOid: String, expires: Long)

@Bean
class MigriJsonWebToken(mapper: ObjectMapper = new ObjectMapper()) {

  @Value("${migri.key}")
  val secret: String = null
  mapper.registerModule(DefaultScalaModule)
  mapper.registerModule(new Jdk8Module())

  if (secret.getBytes.length * 8 < MINIMUM_SECRET_LENGTH_IN_BITS)
    throw new RuntimeException("(MIGRI) HMAC secret has to be at least 256 bits")

  val algo: JwtAlgorithm = JwtAlgorithm.HS256

  def createMigriJWT(hakijaOid: String): String = {
    val migriJwt = MigriJWT(hakijaOid, System.currentTimeMillis + EXPIRATION_TIME)
    Jwt.encode(mapper.writeValueAsString(migriJwt), secret, algo)
  }
}

@Bean
class OiliJsonWebToken(mapper: ObjectMapper = new ObjectMapper()) {

  @Value("${oili.key}")
  val secret: String = null

  if (secret.getBytes.length * 8 < MINIMUM_SECRET_LENGTH_IN_BITS)
    throw new RuntimeException("HMAC secret has to be at least 256 bits")

  val algo: JwtAlgorithm = JwtAlgorithm.HS256

  def createOiliJwt(hakijaOid: String): String = {
    val oiliJwt = OiliJWT(hakijaOid, System.currentTimeMillis + EXPIRATION_TIME)
    Jwt.encode(mapper.writeValueAsString(oiliJwt), secret, algo)
  }

}
