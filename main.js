import {projects} from './projects.js'
import { writeFile } from 'fs/promises';
import { EventEmitter } from 'events';
const filePath = "./projects.js"

const addTask = async (task, projectId) => {

  try {
    const projectIndex = projects.findIndex((p) => p.id === projectId);
    //Genero la estructura de la nueva tarea
    const newTask = {
      id: projects[projectIndex].tasks.length + 1,
      description: task.name,
      status: task.state || "pending",
      deadline: task.deadline,
    };
    //Agrego al arreglo de projects la nueva tarea
    projects[projectIndex].tasks.push(newTask);
    //Vuelvo a escribir mi archivo projects.js
    await writeFile(filePath, `export const projects = ${JSON.stringify(projects, null, 2)};`, 'utf8');

    return { message: "Tarea agregada correctamente" };

  } catch (error) {
    console.error('Error al agregar la tarea:', error);
  }

};
//Genero el objeto para probar la función
const task = {
  name: "Test",
  deadline: "2024-12-20",
  state: "pending",
};

console.log(await addTask(task,1))

const createSummary = (projectId) => {
  //Verifico que el proyecto exista
  const project = projects.find((p) => p.id === projectId);
  
  if (!project) {
    return 'No existe este proyecto';
  }
  //Obtengo el acumulado por tarea segun su estado
  const summary = project.tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  return summary;
};

console.log(createSummary(1));


const orderByDeadline = (projectId) => {
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return 'No existe este proyecto';
  }
  //ordeno de manera acendente con el metodo SORT segun la fecha limite
  return project.tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
};

console.log(orderByDeadline(1));


const filterTaskByProject = (projectId, filterFn) => {
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return 'No existe este proyecto';
  }
  //Filtro segun la función pasada por parametros
  return project.tasks.filter(filterFn);
};

console.log(filterTaskByProject(1, (task) => task.status === "pending"));

const remainingTime = (projectId) => {
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return 'No existe este proyecto';
  }

  const totalDays = project.tasks.reduce((acc, task) => {
    if (task.status === "pending") {
      //Primero calculo los dias faltantes para cada tarea segun su limite y acumulo el total de dias para el total del proyecto
      const remainingDays = (new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24);
      return acc + Math.max(0, Math.ceil(remainingDays));
    }
    return acc;
  }, 0);

  return `Dias totales : ${totalDays}`;
};

console.log(remainingTime(1));


const criticalTasks = (projectId) => {
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return 'No existe este proyecto';
  }

  return project.tasks.filter(
    //filtro por las tareas que no esten completadas y que falten menos de 3 dias para su fecha limite
    (task) =>
      task.status !== "completed" &&
      (new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24) <= 3
  );
};

console.log(criticalTasks(1));

const getProject = async (projectId) => {
  return new Promise((resolve, reject) => {
    //Simulo una petición que busca el proyecto por el id y devuelve el proyecto
    setTimeout(() => {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        resolve(project);
      } else {
        reject('No existe este proyecto');
      }
    }, 1000); //Genero un desfase de 1 segundo
  });
};

//Hago una petición asincrona para cargar el proyecto
(async () => {
  try {
    const projectDetails = await getProject(1);
    console.log(projectDetails);
  } catch (error) {
    console.error(error);
  }
})();

//Genero una instancia de EventEmitter
const notificationTask = new EventEmitter();

const updateTasks = async (projectId, taskId, newState) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const projectIndex = projects.findIndex((p) => p.id === projectId);

      if (projectIndex === -1) {
        return reject('No existe este proyecto');
      }
      //Obtengo el indice de la tarea para actualizar
      const taskIndex = projects[projectIndex].tasks.findIndex((t) => t.id === taskId);

      if (taskIndex === -1) {
        return reject('No existe esta tarea');
      }
      //Actualizo el estado a su nuevo estado
      projects[projectIndex].tasks[taskIndex].status = newState;
      resolve('Tarea actualizada con exito');
    }, 1000); 
  });
};

//Genero una funcion para generar las notificaciones al actualizar la tarea
const updateStateEmitter = async (projectId, taskId, newState) => {
  try {
    const result = await updateTasks(projectId, taskId, newState);
    notificationTask.emit('taskcompleted', "Tarea Actualizada con exito");
  } catch (error) {
    notificationTask.emit('errorTask', error);
    throw error;
  }
};
//Genero una suscripcion al evento. Este evento se emite cuando una tarea ha sido actualizada exitosamente.
notificationTask.on('taskcompleted', (message) => {
  console.log(`Notification: ${message}`);
});
//Genero una suscripcion al evento. Este evento se emite cuando existe un error en la ejecucuión
notificationTask.on('errorTask', (error) => {
  console.error(`Error: ${error}`);
});

(async () => {
  try {
    await updateStateEmitter(1, 2, 'completed'); 
  } catch (error) {
    console.error(error);
  }
})();