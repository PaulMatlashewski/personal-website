import * as React from 'react'
import { StaticImage } from 'gatsby-plugin-image'
import Layout from '../../components/layout/layout'
import Card from '../../components/card/card'
import { cardTitle, cardDescription, cardImage } from '../../components/card/card.module.css'
import { projects } from './projects.module.css'

const ProjectsPage = () => {
  return (
    <Layout pageTitle="Projects">
      <div className={projects}>
        <Card page='/projects/fluid'>
          <StaticImage className={cardImage}
              alt="Fluid"
              src="../../images/kelvin_helmholtz.jpg"
            />
            <h2 className={cardTitle}><b>GPU Fluid Simulation</b></h2>
            <p className={cardDescription}>
              A real time GPU fluid simulation built with WebGL and React.
            </p>
          </Card>
        </div>
    </Layout>
  )
}

export default ProjectsPage
