package fi.oph.opiskelijavalinta.session

import org.apereo.cas.client.session.SessionMappingStorage

trait OphSessionMappingStorage extends SessionMappingStorage {
  def clean(): Unit;

}
