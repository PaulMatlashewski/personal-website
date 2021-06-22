import * as React from 'react'
import { StaticImage } from 'gatsby-plugin-image'
import Layout from '../../components/layout/layout'
import Card from '../../components/card/card'
import { cardTitle, cardDescription, cardImage } from '../../components/card/card.module.css'

const ProjectsPage = () => {
  return (
    <Layout pageTitle="Projects">
      <Card>
        <StaticImage className={cardImage}
            alt="Fluid"
            src="../../images/kelvin_helmholtz.jpg"
          />
          <h2 className={cardTitle}><b>Fluid Simulation</b></h2>
          <p className={cardDescription}>
            A short description of my fluid simulation project.
          </p>
        </Card>
    </Layout>
  )
}

export default ProjectsPage
