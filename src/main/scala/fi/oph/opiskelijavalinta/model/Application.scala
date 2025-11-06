package fi.oph.opiskelijavalinta.model

case class Application(haku: String, hakukohteet: List[String], secret: String)
