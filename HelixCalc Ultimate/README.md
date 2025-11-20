\# HelixCalc Ultimate - Compression Spring Designer



HelixCalc is a professional-grade, client-side web application for designing, analyzing, and reverse-engineering compression springs. It features real-time physics calculations, 2D visualization, and a dedicated solver for determining wire gauge based on force requirements.



\## Features



\*   \*\*Real-time Physics Engine:\*\* Instantly calculates Spring Rate ($k$), Solid Height, and Travel.

\*   \*\*Multi-Mode Solver:\*\*

&nbsp;   \*   \*Standard:\* Input Geometry $\\to$ Output Performance.

&nbsp;   \*   \*Target Rate:\* Input desired $k$ $\\to$ Solve for \*\*Wire Diameter\*\* or \*\*Active Coils\*\*.

\*   \*\*Reverse Engineering:\*\* Input a specific Load (Force) at a specific Length to determine the required Spring Rate, then auto-apply this to the design.

\*   \*\*Visualizer:\*\* HTML5 Canvas renderer that draws the spring to scale based on your inputs.

\*   \*\*Load Simulator:\*\* Drag a virtual compressor to see the Force generated at any specific length.

\*   \*\*Export:\*\* Download a `.txt` report of your design.



\## Installation



No server, Node.js, or database is required. This is a static web application.



1\.  Download the repository.

2\.  Ensure you have the three files in the same folder:

&nbsp;   \*   `index.html`

&nbsp;   \*   `style.css`

&nbsp;   \*   `script.js`

3\.  Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).



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

