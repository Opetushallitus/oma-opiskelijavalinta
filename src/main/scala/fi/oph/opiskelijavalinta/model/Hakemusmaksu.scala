package fi.oph.opiskelijavalinta.model

/**
 * Maksut-palvelun lasku. Kentät ovat maksut-palvelun rajapinnan mukaisesti snake_case-muotoisia.
 */
case class MaksutLasku(
  reference: String,
  status: String,
  origin: String,
  paid_at: Option[String]
)

/**
 * Hakemusmaksun maksupäivä muodossa yyyy-MM-dd, tai tyhjä jos maksupäivää ei löydy.
 */
case class HakemusmaksunMaksupaiva(maksupaiva: Option[String])
