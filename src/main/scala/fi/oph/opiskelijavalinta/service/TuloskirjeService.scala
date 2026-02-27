package fi.oph.opiskelijavalinta.service

import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.{
  GetObjectAttributesRequest,
  GetObjectAttributesResponse,
  NoSuchKeyException
}

import scala.util.{Failure, Success, Try}

@Service
class TuloskirjeService(
  @Value("${oma-opiskelijavalinta.s3.region}") region: String,
  @Value("${oma-opiskelijavalinta.s3.bucket}") bucketName: String
) {

  private val LOGGER: Logger = LoggerFactory.getLogger(classOf[TuloskirjeService]);

  private val s3client: S3Client = S3Client.builder
    .region(Region.of(region))
    .build()

  def getLastModifiedTuloskirje(hakuOid: String, hakemusOid: String): Option[Long] = {
    getObjectMetadata(hakuOid, hakemusOid) match {
      case Some(metadata) => Some(metadata.lastModified.getEpochSecond)
      case None           => None
    }
  }

  private def getObjectMetadata(hakuOid: String, hakemusOid: String): Option[GetObjectAttributesResponse] = {
    val filename                            = s"$hakuOid/$hakemusOid.html"
    val request: GetObjectAttributesRequest =
      GetObjectAttributesRequest.builder().key(filename).bucket(bucketName).build()
    Try(s3client.getObjectAttributes(request)) match {
      case Success(metadata) =>
        Some(metadata)
      case Failure(e: NoSuchKeyException) =>
        None
      case Failure(e) =>
        LOGGER.error(s"Error while trying to get file $filename", e)
        None
    }
  }

}
