package fi.oph.opiskelijavalinta.model

case class KoodistoMetadata(
  nimi: String,
  kieli: String
)

case class KoodistoKoodi(
  koodiArvo: String,
  metadata: Seq[KoodistoMetadata]
) {

  def toTranslatedName: TranslatedName = {
    def name(lang: String): String =
      metadata.find(_.kieli == lang).map(_.nimi).getOrElse("")

    TranslatedName(
      fi = name("FI"),
      sv = name("SV"),
      en = name("EN")
    )
  }
}
