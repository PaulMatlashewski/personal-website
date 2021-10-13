import * as React from 'react'
import Layout from '../../components/layout/layout'
import { aboutCard, title } from './about.module.css'

const AboutPage = () => {
  return (
    <Layout pageTitle="About Paul">
      <div className={aboutCard}>
        <h1 className={title}>About Paul Matlashewski</h1>
        <p>
          I'm a M.Sc. student in geophysics at The University of British Columbia.
          After completing my bachelor's degree in geological engineering, I worked
          as a consulting engineer for nearly 4 years before returning to
          graduate school.
        </p>
        <p>
          I've developed a passion for writing software to solve challenging problems.
          During my time as a consulting engineer, I had the opportunity to write
          code to predict landslides and slope failure, detect rockfall events
          from LiDAR point clouds, analyze terabytes of distributed data to discover
          environmental contamination sources, and more. I hope to continue to write
          software professionally and contribute to large scale, challenging software
          projects.
        </p>
        <p>
          Academically, I'm especially interested in mathematical and numerical modeling.
          My research is focused on understanding the fundamental mechanics of
          surging glaciers, which involves a combination of ideas from partial differential
          equations, dynamical systems and bifurcation theory. Numerically solving a
          coupled hyperbolic/elliptic system of partial differential equations is a major
          component of my work.
        </p>
        <p>
          My graduate course work has focused on fluid dynamics, dynamical systems,
          optimization, linear programing, and machine learning. The intersection of
          mathematical models based on differential equations with machine learning models
          is an area I find fascinating and hope to continue to explore.
        </p>
      </div>
    </Layout>
  )
}

export default AboutPage
