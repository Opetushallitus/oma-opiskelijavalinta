package fi.oph.opiskelijavalinta.model

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.{DeserializationContext, JsonDeserializer}
import org.slf4j.{Logger, LoggerFactory}

class MaksutilaDeserializer extends JsonDeserializer[Maksutila]:

  val LOG: Logger = LoggerFactory.getLogger(classOf[MaksutilaDeserializer]);

  override def deserialize(
    p: JsonParser,
    ctxt: DeserializationContext
  ): Maksutila =
    p.getText match
      case "awaiting"     => Maksutila.awaiting
      case "not-required" => Maksutila.notRequired
      case "ok-by-proxy"  => Maksutila.OkByProxy
      case "overdue"      => Maksutila.overdue
      case "paid"         => Maksutila.paid
      case other          =>
        LOG.warn(s"Tuntematon maksutila: $other")
        null // Jackson mappaa Noneksi

enum Maksutila:
  case awaiting
  case notRequired
  case OkByProxy
  case overdue
  case paid
