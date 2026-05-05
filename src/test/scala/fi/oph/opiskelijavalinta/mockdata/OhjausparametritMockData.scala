package fi.oph.opiskelijavalinta.mockdata

import fi.oph.opiskelijavalinta.model.{DateParam, OhjausparametritRaw}

object OhjausparametritMockData {

  val mennytTimestamp          = 1599657520000L
  val paattynytHakukierrosMock = OhjausparametritRaw(
    PH_HKP = Some(DateParam(Some(mennytTimestamp))),
    PH_VTJH = None,
    PH_VSTP = None,
    None,
    None
  )

  val hakukierrosPaattyyTulevaisuudessaMock = OhjausparametritRaw(
    PH_HKP = Some(DateParam(Some(System.currentTimeMillis() + 1000000L))),
    PH_VTJH = None,
    PH_VSTP = None,
    None,
    None
  )

}
