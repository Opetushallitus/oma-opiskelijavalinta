package fi.oph.opiskelijavalinta.util

import fi.oph.opiskelijavalinta.model.{HakutoiveenTulos, TranslatedName}
import org.slf4j.LoggerFactory

object TranslationUtil {

  private val logger = LoggerFactory.getLogger(TranslationUtil.getClass)

  def inlineHyvaksymisenEhto(tulos: HakutoiveenTulos): Option[TranslatedName] =
    for {
      fi <- tulos.ehdollisenHyvaksymisenEhtoFI
      sv <- tulos.ehdollisenHyvaksymisenEhtoSV
      en <- tulos.ehdollisenHyvaksymisenEhtoEN
    } yield TranslatedName(fi, sv, en)

  private def getClosestMatchingLanguage(
    lang1: Option[String],
    lang2: Option[String],
    lang3: Option[String]
  ): String = {
    (lang1, lang2, lang3) match {
      case (Some(s), _, _)       => s
      case (None, Some(s), _)    => s
      case (None, None, Some(s)) => s
      case _                     =>
        logger.warn("Käännöstä ei löytynyt millekään kielelle käännettäessä nimeä")
        ""
    }
  }

  def translateName(translateable: TranslatedName, lang: SupportedLanguage): String = {
    val translationFi = Some(translateable.fi.trim).filter(s => s.nonEmpty)
    val translationSv = Some(translateable.sv.trim).filter(s => s.nonEmpty)
    val translationEn = Some(translateable.en.trim).filter(s => s.nonEmpty)
    lang match {
      case SupportedLanguage.fi => getClosestMatchingLanguage(translationFi, translationEn, translationSv)
      case SupportedLanguage.sv => getClosestMatchingLanguage(translationSv, translationFi, translationEn)
      case SupportedLanguage.en => getClosestMatchingLanguage(translationEn, translationFi, translationSv)
    }
  }
}
