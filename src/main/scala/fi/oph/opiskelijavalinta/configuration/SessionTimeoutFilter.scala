package fi.oph.opiskelijavalinta.configuration

import jakarta.servlet.*
import jakarta.servlet.http.*
import org.springframework.stereotype.Component

import java.io.IOException

/** Enforces an absolute 4-hour session lifetime from creation time, without renewal on user activity.
  */
@Component
class SessionTimeoutFilter extends Filter:

  private val MaxSessionAgeMs = 4 * 60 * 60 * 1000L // 4 hours

  @throws[IOException]
  @throws[ServletException]
  override def doFilter(request: ServletRequest, response: ServletResponse, chain: FilterChain): Unit =
    (request, response) match
      case (req: HttpServletRequest, res: HttpServletResponse) =>
        val session = req.getSession(false)
        if session != null then
          val creationTime = session.getCreationTime
          val ageMs = System.currentTimeMillis() - creationTime
          if ageMs > MaxSessionAgeMs then
            // Invalidate Spring Session (via your HttpSessionAdapter)
            session.invalidate()
            res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Session expired (absolute 4h lifetime)")
            return
        chain.doFilter(request, response)

      case _ =>
        // non-HTTP request, just continue
        chain.doFilter(request, response)
