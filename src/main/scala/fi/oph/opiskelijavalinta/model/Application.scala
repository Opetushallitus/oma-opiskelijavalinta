package fi.oph.opiskelijavalinta.model

import com.fasterxml.jackson.annotation.{JsonKey, JsonProperty}
import fi.oph.opiskelijavalinta.model.Haku

case class Application(
  oid: String,
  haku: String,
  hakukohteet: List[String],
  secret: String,
  submitted: String,
  @JsonProperty("form-name") formName: TranslatedName
)
