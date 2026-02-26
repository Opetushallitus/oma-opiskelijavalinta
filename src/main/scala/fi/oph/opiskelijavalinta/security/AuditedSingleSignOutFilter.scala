package fi.oph.opiskelijavalinta.security

import jakarta.servlet.{Filter, FilterChain, FilterConfig, ServletRequest, ServletResponse}
import jakarta.servlet.http.{HttpServletRequest, HttpServletResponse}
import org.apereo.cas.client.session.SingleSignOutFilter.setSessionMappingStorage
import org.apereo.cas.client.session.{SessionMappingStorage, SingleSignOutFilter}
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder

class AuditedSingleSignOutFilter(singleSignOutFilter: SingleSignOutFilter) extends Filter {

  private val LOG = LoggerFactory.getLogger(getClass)

  override def init(filterConfig: FilterConfig): Unit = {
    singleSignOutFilter.init(filterConfig)
  }

  override def destroy(): Unit = {
    singleSignOutFilter.destroy()
  }

  override def doFilter(request: ServletRequest, response: ServletResponse, chain: FilterChain): Unit = {
    val req = request.asInstanceOf[HttpServletRequest]

    val isCasBackchannelLogout = req.getMethod == "POST" && req.getParameter("logoutRequest") != null

    if (isCasBackchannelLogout) {
      val auth = SecurityContextHolder.getContext.getAuthentication

      if (auth != null) {
        LOG.info(s"CAS backchannel logout triggered for user: ${auth.getName}, authorities: ${auth.getAuthorities}")
        AuditLog.log(req, Map.empty, AuditOperation.Logout, None)
      } else {
        LOG.info(s"CAS backchannel logout triggered but no authentication found for session: ${req.getSession(false)}")
      }
    }

    // delegate to the original SingleSignOutFilter
    singleSignOutFilter.doFilter(request, response, chain)
  }
}
