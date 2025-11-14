package fi.oph.opiskelijavalinta.configuration

import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.EnableCaching
import org.springframework.cache.caffeine.CaffeineCacheManager
import org.springframework.cache.concurrent.ConcurrentMapCacheManager
import org.springframework.context.annotation.{Bean, Configuration}
import com.github.benmanes.caffeine.cache.{Caffeine, LoadingCache}

import java.util.concurrent.TimeUnit

object CacheConstants {
  final val OAUTH2_CACHE_NAME = "oauth2Bearer"
  final val KOUTA_HAKU_CACHE_NAME = "KOUTA_HAKU_CACHE"
  final val KOUTA_HAKUKOHDE_CACHE_NAME = "KOUTA_HAKUKOHDE_CACHE"
  final val OHJAUSPARAMETRIT_CACHE_NAME = "OHJAUSPARAMETRIT_CACHE"

  final val DEFAULT_EXPIRATION_MINUTES = 15
  final val DEFAULT_MAX_SIZE = 10000
}

@Configuration
@EnableCaching
class CacheConfiguration {

  @Bean
  def cacheManager: CacheManager = {
    val cacheManager: CaffeineCacheManager = new CaffeineCacheManager(CacheConstants.KOUTA_HAKU_CACHE_NAME, CacheConstants.KOUTA_HAKUKOHDE_CACHE_NAME, CacheConstants.OHJAUSPARAMETRIT_CACHE_NAME, CacheConstants.OAUTH2_CACHE_NAME)
    cacheManager.setCaffeine(Caffeine.newBuilder.expireAfterWrite(CacheConstants.DEFAULT_EXPIRATION_MINUTES, TimeUnit.MINUTES).maximumSize(CacheConstants.DEFAULT_MAX_SIZE))
    cacheManager
  }
}
