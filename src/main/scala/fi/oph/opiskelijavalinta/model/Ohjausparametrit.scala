package fi.oph.opiskelijavalinta.model

case class Ohjausparametrit(PH_HKP: Option[DateParam], // hakukierrosPaattyy
                            PH_IP: Option[DateParam],  // ilmoittautuminenPaattyy
                            PH_VTJH: Option[DateParam], // Valintatulosten julkistaminen hakijoille
                            PH_EVR: Option[DateParam], // Ehdolliset valinnat raukeavat
                            PH_OPVP: Option[DateParam], // Opiskelijan paikan vastaanotto päättyy
                           )

case class DateParam(date: Option[Long])

case class ValueParam(value: Option[Int])
