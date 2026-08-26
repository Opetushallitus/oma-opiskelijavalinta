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
  paymentState: Option[String],
  paymentDueDate: Option[ZonedDateTime],
  paymentSum: Option[String],
  paymentReason: Option[String],
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
