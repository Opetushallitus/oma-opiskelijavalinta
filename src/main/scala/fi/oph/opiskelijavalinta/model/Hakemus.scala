package fi.oph.opiskelijavalinta.model

import fi.oph.opiskelijavalinta.model.{Hakemus, Maksutila, TranslatedName}

import java.time.ZonedDateTime

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
