# Best Practices for PCB Design to Optimize EMC Performance

In PCB design there are guidelines to optimize EMC performance:

- Always consider and determine where and how the return currents are flowing.
- Do not route signals over ground gaps.
- Partition mixed-signal PCBs with separate analog and digital sections
- Do not split the current return plane; use one solid plane under both analog and digital
sections of the board.
- Route digital signals only in the digital section of the board (for all digital related layers).
- Route analog signals only in the analog section of the board (for all analog related
layers).
- In case ground or power planes are split for a specific reason (i.e. mechanical and or
electrical), do not run any traces across the split on an adjacent layer.
- Traces (analog or digital) that must go over a power plane split must be on a layer
adjacent to a solid ground plane (analog or digital).
- A/D and D/A converters, as well as most other mixed-signal ICs, should be considered
as analog devices with a digital section, not digital devices with an analog section.
- The AGND and DGND designation on the pins of a mixed signal IC refers to where the
pins are connected internally, and it does not imply where or how they should be
connected externally. On most mixed-signal ICs, both the AGND and DGND pins
should be connected to the analog return plane.
- The digital decoupling capacitor should be connected directly to the digital ground pin.
- The decoupling capacitors are needed to supply, through a low-inductance path, some
or all of the transient power supply current required when an IC logic gate switches.
- Decoupling capacitors are needed to short out, or at least reduce the noise injected
back into the power ground system.
- Decoupling is not the process of placing a capacitor adjacent to an IC to supply the
transient switching current; rather it is the process of placing an L-C network adjacent
to the IC to supply the transient switching current.
- The value of the decoupling capacitor(s) is important for the low-frequency decoupling
effectiveness.
- The value of the decoupling capacitor(s) is not important at high frequencies. At high
frequencies, the most important criteria is to reduce the inductance in series with the
decoupling capacitors.
- Effective high-frequency decoupling requires the use of a large number of capacitors.
- Place decoupling capacitors as close as possible to the device.
- Route RFI and RFO signals symmetrically, and avoid long signal traces for the
matching network. Keep the traces between RFO1 and RFO2 close to each other, and
do the same for RFI1 and RFI2.
- The matching components need be placed close to each other, and symmetrically

### SOurces and Further Reading

- ST Application Note AN4835: [PCB Design Guidelines to Optimize EMC Performance](https://www.st.com/resource/en/application_note/dm00224591-pcb-design-guidelines-to-optimize-emc-performance-stmicroelectronics.pdf)
- ST Application Note AN5240: [How to Design a PCB for ST25R NFC/RFID Products](https://www.st.com/resource/en/application_note/an5240-layout-recommendations-for-the-design-of-boards-with-the-st25r391616b-1717b-18-19b-and-2020b-devices-stmicroelectronics.pdf)
