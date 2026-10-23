package fi.oph.opiskelijavalinta.util

import fi.oph.opiskelijavalinta.Constants.{KOULUTUKSEN_ALKAMISKAUSI_KEVAT, KOULUTUKSEN_ALKAMISKAUSI_SYKSY}
import org.slf4j.{Logger, LoggerFactory}

object KoodistoUtil {
  private val LOG: Logger = LoggerFactory.getLogger(getClass)

  def normalizeAlkamiskausi(koodiUri: Option[String]): Option[String] =
    koodiUri match {
      case Some(uri) if uri.startsWith(KOULUTUKSEN_ALKAMISKAUSI_KEVAT) => Some(KOULUTUKSEN_ALKAMISKAUSI_KEVAT)
      case Some(uri) if uri.startsWith(KOULUTUKSEN_ALKAMISKAUSI_SYKSY) => Some(KOULUTUKSEN_ALKAMISKAUSI_SYKSY)
      case Some(uri)                                                   =>
        LOG.error(s"Tuntematon alkamiskausi: $uri")
        None
      case None => None
    }
}
