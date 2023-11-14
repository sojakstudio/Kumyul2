import gulp from 'gulp';
import { deleteAsync } from 'del';
import gulpTypescript from 'gulp-typescript';

const { createProject } = gulpTypescript;

const tsProject = createProject('tsconfig.json');

const { dest } = gulp;

export function clean() {
  return deleteAsync('dist');
}

export default () => {
  return tsProject.src().pipe(tsProject()).js.pipe(dest('dist'));
};
