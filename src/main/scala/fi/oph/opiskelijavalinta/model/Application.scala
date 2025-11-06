package fi.oph.opiskelijavalinta.model

import fi.oph.opiskelijavalinta.model.Haku

case class Application(oid: String, haku: String, hakukohteet: Set[String], secret: String)
