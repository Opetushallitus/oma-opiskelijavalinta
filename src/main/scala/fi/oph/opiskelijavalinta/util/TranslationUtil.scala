package fi.oph.opiskelijavalinta.util

import fi.oph.opiskelijavalinta.model.{HakutoiveenTulos, TranslatedName}

object TranslationUtil {

  def inlineHyvaksymisenEhto(tulos: HakutoiveenTulos): Option[TranslatedName] =
    for {
      fi <- tulos.ehdollisenHyvaksymisenEhtoFI
      sv <- tulos.ehdollisenHyvaksymisenEhtoSV
      en <- tulos.ehdollisenHyvaksymisenEhtoEN
    } yield TranslatedName(fi, sv, en)
}
