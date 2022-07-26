<template>
  <div class='operation-item'>
    <slot name="edit"></slot> 
    <slot name="delete"></slot> 
    <div><slot name="user-defined"></slot></div>
  </div>
</template>

<script>
export default {
  name: 'OperationItem',
  data () {
    return {
      
    };
  }
}
</script>

<style lang='less' scoped>
  
</style>