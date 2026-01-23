package fi.oph.opiskelijavalinta.model

import com.fasterxml.jackson.annotation.{JsonKey, JsonProperty}
import fi.oph.opiskelijavalinta.model.Haku

case class Hakemus(
  oid: String,
  haku: String,
  hakukohteet: List[String],
  secret: String,
  submitted: String,
  processing: Boolean,
  @JsonProperty("form-name") formName: TranslatedName,
  hakuaikaIsOn: Option[Boolean],
  hakuaikaEnds: Option[Long]
)
