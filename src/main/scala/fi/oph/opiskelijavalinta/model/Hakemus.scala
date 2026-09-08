package fi.oph.opiskelijavalinta.model

import com.fasterxml.jackson.annotation.{JsonKey, JsonProperty}
import java.time.ZonedDateTime

enum Maksutila:
  case awaiting, notRequired, OkByProxy, overdue, paid

case class Hakemus(
  oid: String,
  haku: String,
  hakukohteet: List[String],
  secret: String,
  submitted: String,
  processing: Boolean,
  @JsonProperty("payment-state") paymentState: Option[String],
  @JsonProperty("payment-due-date") paymentDueDate: Option[ZonedDateTime],
  @JsonProperty("payment-sum") paymentSum: Option[String],
  @JsonProperty("payment-reason") paymentReason: Option[String],
  @JsonProperty("form-name") formName: TranslatedName,
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
