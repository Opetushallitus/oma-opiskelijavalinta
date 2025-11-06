package fi.oph.opiskelijavalinta.model

import fi.oph.opiskelijavalinta.model.Haku

case class Application(oid: String, haku: String, hakukohteet: List[String], secret: String)
