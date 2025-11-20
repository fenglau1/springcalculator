\# HelixCalc Ultimate - Compression Spring Designer



HelixCalc is a professional-grade, client-side web application for designing, analyzing, and reverse-engineering compression springs. It features real-time physics calculations, 2D visualization, and a dedicated solver for determining wire gauge based on force requirements.



\## Usage Guide



\### 1. Design Parameters (Left Column)

Adjust the sliders or type values for Wire Diameter, Outer Diameter, and Active Coils.

\*   \*\*Material:\*\* Changing the material updates the Shear Modulus ($G$), affecting the spring stiffness immediately.



\### 2. Solver Modes

Use the dropdown at the top left to change calculation direction:

\*   \*\*Solve for Wire Dia:\*\* Locks the Wire input. You enter a "Target Rate", and the app calculates the exact wire thickness needed.



\### 3. Reverse Engineering

If you don't know the Rate ($k$), but you know you need "150N at 40mm length":

1\.  Enter 150 into Force and 40 into Length.

2\.  The app calculates the required $k$.

3\.  Click \*\*"Auto-Design"\*\* to automatically solve the geometry to match this requirement.



\## Formulas Used



\*\*Spring Rate ($k$):\*\*

$$ k = \\frac{G \\cdot d^4}{8 \\cdot D^3 \\cdot N\_a} $$



\*\*Mean Diameter ($D$):\*\*

$$ D = OD - d $$



\*\*Solid Height:\*\*

$$ L\_s \\approx (N\_a + 2) \\cdot d $$

\*(Assumes squared and ground ends)\*



\*\*Shear Modulus ($G$):\*\*

\*   Music Wire (ASTM A228): 79,300 MPa

\*   Stainless Steel (302/304): 77,200 MPa

\*   Chrome Silicon: 79,300 MPa

\*   Phosphor Bronze: 41,400 MPa



\## License

MIT License. Free for personal and commercial use.


