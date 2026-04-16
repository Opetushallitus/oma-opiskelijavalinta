package fi.oph.opiskelijavalinta.configuration

import org.springframework.context.annotation.{Bean, Configuration}

import java.util.concurrent.*
import scala.concurrent.{ExecutionContext, ExecutionContextExecutor}

@Configuration
class ThreadPoolConfig {

  @Bean
  def httpThreadPool(): ThreadPoolExecutor = {

    val threadFactory = new ThreadFactory {
      private val counter = new java.util.concurrent.atomic.AtomicInteger(0)

      override def newThread(r: Runnable): Thread = {
        val t = new Thread(r)
        t.setName(s"http-client-${counter.incrementAndGet()}")
        t.setDaemon(true)
        t
      }
    }

    val queueSize = 1000

    val queue: BlockingQueue[Runnable] =
      new ArrayBlockingQueue[Runnable](queueSize)

    new ThreadPoolExecutor(
      100,  // core threads
      500, // max threads
      60L,
      TimeUnit.SECONDS,
      queue,
      threadFactory,
      new ThreadPoolExecutor.AbortPolicy()
    )
  }

  @Bean
  def httpExecutionContext(pool: ThreadPoolExecutor): ExecutionContextExecutor =
    ExecutionContext.fromExecutor(pool)
}
