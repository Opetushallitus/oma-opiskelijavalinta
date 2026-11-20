package fi.oph.opiskelijavalinta.model

import com.fasterxml.jackson.annotation.JsonProperty

/**
 * Maksut-palvelun lasku.
 */
case class MaksutLasku(
  reference: String,
  status: String,
  origin: String,
  @JsonProperty("paid_at") paidAt: Option[String]
)

/**
 * Hakemusmaksun maksupäivä muodossa yyyy-MM-dd, tai tyhjä jos maksupäivää ei löydy.
 */
case class HakemusmaksunMaksupaiva(maksupaiva: Option[String])
