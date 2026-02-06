package fi.oph.opiskelijavalinta.clients

import org.asynchttpclient.{ListenableFuture, Response}

import scala.concurrent.{ExecutionContext, Future, Promise}
import scala.util.{Failure, Success, Try}

object ClientUtils {

  /**
   * Convert an AsyncHttpClient ListenableFuture into a Scala Future.
   */
  def toScalaFuture(listenableFuture: ListenableFuture[Response])(using ec: ExecutionContext): Future[Response] = {
    val promise = Promise[Response]()

    listenableFuture.addListener(
      () =>
        Try(listenableFuture.get()) match
          case Success(resp) => promise.success(resp)
          case Failure(ex)   => promise.failure(ex),
      r => ec.execute(r)
    )
    promise.future
  }

}
