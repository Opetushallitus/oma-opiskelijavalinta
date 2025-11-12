package fi.oph.opiskelijavalinta.model

case class Ohjausparametrit(PH_HKP: Option[DateParam], // hakukierrosPaattyy
                            PH_IP: Option[DateParam],  // ilmoittautuminenPaattyy
                            PH_VTJH: Option[DateParam], // tulostenJulkistusAlkaa
                           )

case class DateParam(date: Option[Long])

case class ValueParam(value: Option[Int])
