package fi.oph.opiskelijavalinta.model

import com.fasterxml.jackson.annotation.{JsonKey, JsonProperty}
import java.time.ZonedDateTime

enum Maksutila:
  @JsonProperty("awaiting")
  case awaiting

  @JsonProperty("not-required")
  case notRequired

  @JsonProperty("ok-by-proxy")
  case OkByProxy

  @JsonProperty("overdue")
  case overdue

  @JsonProperty("paid")
  case paid

case class Hakemus(
  oid: String,
  haku: String,
  hakukohteet: List[String],
  secret: String,
  submitted: String,
  processing: Boolean,
  paymentState: Option[Maksutila],
  paymentDueDate: Option[String],
  paymentSum: Option[String],
  paymentReason: Option[String],
  paymentLink: Option[String],
  formName: TranslatedName,
  hakuaikaIsOn: Option[Boolean],
  hakuaikaEnds: Option[Long],
  email: Option[String],
  asiointikieli: Option[String]
)

case class HakemusVastaanottoViestille(
  oid: String,
  email: Option[String],
  hakutoive: Option[String]
)

case class HakemuksenLahetysTiedot(email: Option[String], asiointikieli: Option[String])
